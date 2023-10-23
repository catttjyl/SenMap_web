import { openArray } from "zarr";
export const getZarr = async (pol) => {
  return await openArray({
    store: "https://inmap-model.s3.us-east-2.amazonaws.com",
    path: `isrm_v1.2.1.zarr/${pol}`,
    mode: "r",
    shape: [1, 3224, 52411],
  });
};

// export const getZarr = async (pol) => {
//   return await openArray({
//     store: "https://inmap-model.s3.us-east-2.amazonaws.com",
//     path: `Ag.zarr`,
//     mode: "r",
//     shape: [1, 3224, 52411],
//   });
// };