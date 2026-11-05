import {cn} from 'cn';
import type {ComponentProps} from 'react';
import {ColorPicker} from './color-picker';
import {OptionPicker} from './option-picker';
import type {OptionGroupState} from './types';

interface ProductInfoOptionsProps extends ComponentProps<'div'> {
  compact?: boolean;
  hideImages?: boolean;
  options: OptionGroupState[];
}

export function ProductInfoOptions({
  compact = false,
  hideImages,
  options,
  className,
  ...props
}: ProductInfoOptionsProps) {
  const isColorOption = (opt: OptionGroupState) =>
    opt.values.some((v) => v.swatch?.color || v.swatch?.image) ||
    opt.name.toLowerCase().includes('color');
  // Shopify emits a synthetic Title/Default Title option for products with no variant axes.
  const isShopifyDefaultOption = (opt: OptionGroupState) =>
    opt.name === 'Title' && opt.values.length === 1 && opt.values[0]?.name === 'Default Title';
  const isSingleValueOption = (opt: OptionGroupState) => opt.values.length === 1;
  // Short values (R, L, S, M) get compact square pills; longer ones get wide pills.
  const layoutFor = (opt: OptionGroupState) =>
    opt.values.every((v) => v.name.length <= 3) ? 'square' : 'wide';
  const renderable = options.filter((opt) => !isShopifyDefaultOption(opt));
  if (renderable.length === 0) return null;

  const singleValueOptions = renderable.filter(isSingleValueOption);
  const colorOptions = renderable.filter((opt) => !isSingleValueOption(opt) && isColorOption(opt));
  const otherOptions = renderable.filter((opt) => !isSingleValueOption(opt) && !isColorOption(opt));
  return (
    <div data-slot="product-info-options" className={className} {...props}>
      <div className={cn('grid', compact ? 'gap-2.5' : 'gap-5')}>
        {singleValueOptions.map((option) => (
          <p key={option.name} className="text-ds-regular font-semibold text-foreground">
            {option.name}:{' '}
            <span className="font-normal text-foreground/60">{option.values[0]?.name}</span>
          </p>
        ))}
        {otherOptions.map((option) => (
          <OptionPicker
            compact={compact}
            key={option.name}
            layout={layoutFor(option)}
            option={option}
          />
        ))}
        {colorOptions.map((option) => (
          <ColorPicker key={option.name} hideImages={hideImages ?? false} option={option} />
        ))}
      </div>
    </div>
  );
}