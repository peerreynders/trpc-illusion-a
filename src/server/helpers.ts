const hasOwnProperty = Object.hasOwnProperty;

function hasOwn(object: unknown, key: string): boolean {
  if (!(object && typeof object === 'object')) return false;
  return hasOwnProperty.call(object, key);
}

export {
  hasOwn,
}

