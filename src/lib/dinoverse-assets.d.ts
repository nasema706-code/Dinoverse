declare module "virtual:dinoverse-assets" {
  export type LibraryAsset = {
    name: string;
    src: string;
    kind: "image" | "video";
  };
  const assets: LibraryAsset[];
  export default assets;
}
