export interface OptionValueSwatch {
  color?: string | undefined;
  image?: string | undefined;
}

export interface OptionValueState {
  available: boolean;
  crossProduct: boolean;
  exists: boolean;
  href: string;
  image?: string | undefined;
  name: string;
  selected: boolean;
  swatch?: OptionValueSwatch | undefined;
}

export interface OptionGroupState {
  name: string;
  values: OptionValueState[];
}