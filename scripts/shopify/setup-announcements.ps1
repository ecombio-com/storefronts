# Creates the announcement bar types and starter entries in the store Hydrogen reads.
# Safe to run again: it only creates what is missing and never overwrites entries edited in admin.
param(
  [string]$HydrogenEnv = (Join-Path $PSScriptRoot '..\..\.env'),
  [string]$CredsEnv = 'C:\Users\Admin\BitBucket\shop\storefronts\.env.local',
  [string]$ApiVersion = '2026-10'
)
$ErrorActionPreference = 'Stop'

function Read-Env($p) {
  $h = @{}
  Get-Content -LiteralPath $p | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$') { $h[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'") }
  }
  $h
}
$hy = Read-Env $HydrogenEnv
$cr = Read-Env $CredsEnv
$shop = $hy['PUBLIC_STORE_DOMAIN']
if ($cr['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'] -ne $shop) {
  throw "Sign-in is for $($cr['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN']), but Hydrogen reads $shop. Stopping."
}

$tok = (Invoke-RestMethod -Method Post -Uri "https://$shop/admin/oauth/access_token" -Body @{
  grant_type = 'client_credentials'; client_id = $cr['CMS_APP_CLIENT_ID']; client_secret = $cr['CMS_APP_CLIENT_SECRET'] }).access_token

function Admin($q, $v = @{}) {
  $r = Invoke-RestMethod -Method Post -Uri "https://$shop/admin/api/$ApiVersion/graphql.json" `
    -Headers @{ 'X-Shopify-Access-Token' = $tok } -ContentType 'application/json' `
    -Body (@{ query = $q; variables = $v } | ConvertTo-Json -Depth 20)
  if ($r.errors) { throw ($r.errors | ConvertTo-Json -Depth 10 -Compress) }
  $r.data
}
function Assert-Ok($p, $what) {
  if ($p.userErrors -and @($p.userErrors).Count -gt 0) { throw "$what failed: $($p.userErrors | ConvertTo-Json -Depth 5 -Compress)" }
}

$s = (Admin '{ shop { name myshopifyDomain } }').shop
Write-Host ("Store: {0} ({1})" -f $s.name, $s.myshopifyDomain) -ForegroundColor Green

$GET_DEF = 'query($t: String!) { metaobjectDefinitionByType(type: $t) { id type } }'
$CREATE_DEF = 'mutation($d: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $d) { metaobjectDefinition { id type } userErrors { field message code } } }'
$GET_ENTRY = 'query($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { id handle } }'
$UPSERT = 'mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id handle } userErrors { field message code } } }'

function Ensure-Def($def) {
  $have = (Admin $GET_DEF @{ t = $def.type }).metaobjectDefinitionByType
  if ($have) { Write-Host "skip: type $($def.type) already exists"; return $have.id }
  Write-Host "create: type $($def.type)" -ForegroundColor Cyan
  Write-Host ($def | ConvertTo-Json -Depth 10)
  $p = (Admin $CREATE_DEF @{ d = $def }).metaobjectDefinitionCreate
  Assert-Ok $p "create $($def.type)"
  Write-Host "ok: type $($def.type)" -ForegroundColor Green
  $p.metaobjectDefinition.id
}

function Ensure-Entry($type, $handle, $fields, [bool]$active) {
  $have = (Admin $GET_ENTRY @{ h = @{ type = $type; handle = $handle } }).metaobjectByHandle
  if ($have) { Write-Host "skip: $type/$handle already exists (kept as edited)"; return $have.id }
  $m = @{ fields = @($fields.GetEnumerator() | ForEach-Object { @{ key = $_.Key; value = [string]$_.Value } }) }
  if ($active) { $m.capabilities = @{ publishable = @{ status = 'ACTIVE' } } }
  $p = (Admin $UPSERT @{ h = @{ type = $type; handle = $handle }; m = $m }).metaobjectUpsert
  Assert-Ok $p "create $type/$handle"
  Write-Host "ok: $type/$handle" -ForegroundColor Green
  $p.metaobject.id
}

# ---------- Definitions ----------
$annId = Ensure-Def @{
  type = 'announcement'; name = 'Announcement'; displayNameKey = 'text'
  description = 'One message in the header announcement bar.'
  access = @{ storefront = 'PUBLIC_READ' }
  capabilities = @{ publishable = @{ enabled = $true }; translatable = @{ enabled = $true } }
  fieldDefinitions = @(
    @{ key = 'text'; name = 'Text'; type = 'single_line_text_field'; required = $true },
    @{ key = 'style'; name = 'Style'; type = 'single_line_text_field'; required = $true; validations = @(@{ name = 'choices'; value = '["dark","lavender","lime"]' }) },
    @{ key = 'code'; name = 'Discount code'; type = 'single_line_text_field'; description = 'Shown underlined after the text.' },
    @{ key = 'button_label'; name = 'Button label'; type = 'single_line_text_field'; description = 'Needs a link.' },
    @{ key = 'link'; name = 'Link'; type = 'single_line_text_field'; description = 'A path like /collections/all, or a full https:// URL.'; validations = @(@{ name = 'regex'; value = '^(/|https://)\S*$' }) },
    @{ key = 'starts_at'; name = 'Starts at'; type = 'date_time'; description = 'Leave empty to start now.' },
    @{ key = 'ends_at'; name = 'Ends at'; type = 'date_time'; description = 'Leave empty to run until removed.' },
    @{ key = 'show_countdown'; name = 'Show countdown to end'; type = 'boolean'; description = 'Needs an end time.' },
    @{ key = 'devices'; name = 'Devices'; type = 'list.single_line_text_field'; description = 'Leave empty to show on every device.'; validations = @(@{ name = 'choices'; value = '["mobile","tablet","desktop"]' }) }
  )
}

$null = Ensure-Def @{
  type = 'announcement_bar'; name = 'Announcement bar'
  description = 'Settings and message order for the header announcement bar. Use the entry with handle main.'
  access = @{ storefront = 'PUBLIC_READ' }
  fieldDefinitions = @(
    @{ key = 'enabled'; name = 'Enabled'; type = 'boolean'; required = $true },
    @{ key = 'messages'; name = 'Messages'; type = 'list.metaobject_reference'; description = 'Shown in this order.'; validations = @(@{ name = 'metaobject_definition_id'; value = $annId }) },
    @{ key = 'auto_rotate'; name = 'Auto-rotate'; type = 'boolean' },
    @{ key = 'interval_seconds'; name = 'Seconds per message'; type = 'number_integer'; validations = @(@{ name = 'min'; value = '2' }, @{ name = 'max'; value = '30' }) },
    @{ key = 'dismissible'; name = 'Show close button'; type = 'boolean' }
  )
}

# ---------- Starter entries (today's messages) ----------
$ids = @(
  (Ensure-Entry 'announcement' 'shop-all' ([ordered]@{ text = 'Shop e-bikes, e-scooters and electric skateboards in one place.'; style = 'dark'; button_label = 'Shop all'; link = '/collections/all' }) $true),
  (Ensure-Entry 'announcement' 'trade-in' ([ordered]@{ text = 'Trade in your old ride toward a new one.'; style = 'lavender'; button_label = 'How trade-in works'; link = '/pages/trade-in' }) $true),
  (Ensure-Entry 'announcement' 'guides' ([ordered]@{ text = 'Not sure which ride fits you? Read our buying guides.'; style = 'lime'; button_label = 'Visit the Journal'; link = '/blogs' }) $true)
)
$null = Ensure-Entry 'announcement_bar' 'main' ([ordered]@{
  enabled = 'true'; messages = (ConvertTo-Json -Compress -InputObject @($ids)); auto_rotate = 'true'; interval_seconds = '6'; dismissible = 'true' }) $false

# ---------- Confirm through the Storefront API (how the site reads it) ----------
$sfQ = 'query { metaobject(handle: {type: "announcement_bar", handle: "main"}) { handle enabled: field(key: "enabled") { value } interval: field(key: "interval_seconds") { value } messages: field(key: "messages") { references(first: 10) { nodes { ... on Metaobject { handle text: field(key: "text") { value } style: field(key: "style") { value } link: field(key: "link") { value } } } } } } }'
$sf = Invoke-RestMethod -Method Post -Uri "https://$shop/api/$ApiVersion/graphql.json" `
  -Headers @{ 'X-Shopify-Storefront-Access-Token' = $hy['PUBLIC_STOREFRONT_API_TOKEN'] } -ContentType 'application/json' `
  -Body (@{ query = $sfQ } | ConvertTo-Json)
if ($sf.errors) { throw "Storefront read failed: $($sf.errors | ConvertTo-Json -Compress)" }
$bar = $sf.data.metaobject
if (-not $bar) { throw 'Storefront cannot see announcement_bar/main. Check storefront access on the type.' }
Write-Host ''
Write-Host ("Storefront sees: bar '{0}', enabled={1}, {2}s per message" -f $bar.handle, $bar.enabled.value, $bar.interval.value) -ForegroundColor Green
$bar.messages.references.nodes | ForEach-Object { Write-Host ("  {0,-9} {1,-9} {2,-18} {3}" -f $_.handle, $_.style.value, $_.link.value, $_.text.value) }
