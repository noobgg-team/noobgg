// stringify doesn't support BigInt
const replacer = (key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export function serialize(objToSerialize: object) {
  return JSON.parse(JSON.stringify(objToSerialize, replacer));
}
