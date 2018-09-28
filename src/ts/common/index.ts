//Prototype Merging for Multiple Class Inheritence
/*export const aggregation = (baseClass: any, secondClass: any) => {
  class base extends baseClass {
    constructor(...args: []) {
      super(...args);
      /*mixins.forEach((mixin: any) => {
        copyProps(this, new mixin());
      });
      copyProps(this, new secondClass());
    }
  }
  let copyProps = (target: any, source: any) => {
    // this function copies all properties and symbols, filtering out some special ones
    Object.getOwnPropertyNames(source)
      .concat(Object.getOwnPropertySymbols(source) as any)
      .forEach(prop => {
        if (
          !prop.match(
            /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
          )
        )
          Object.defineProperty(
            target,
            prop,
            Object.getOwnPropertyDescriptor(source, prop)
          );
      });
  };
  mixins.forEach(mixin => {
    // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
    copyProps(base.prototype, (mixin as any).prototype);
    copyProps(base, mixin);
  });
  return base;
};

*/
