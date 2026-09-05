declare module "*.css" {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
  };
}
