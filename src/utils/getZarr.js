import { openArray } from "zarr";
export const getPolZarr = async (pol) => {
  return await openArray({
    store: "https://inmap-model.s3.us-east-2.amazonaws.com",
    path: `isrm_v1.2.1.zarr/${pol}`,
    mode: "r",
    shape: [3, 52411, 52411],
  });
};

export const getSourceZarr = async (src) => {
  return await openArray({
    store: "https://inmap-model.s3.us-east-2.amazonaws.com",
    path: `${src}.zarr`,
    mode: "r",
    shape: [1, 3224, 52411],
  });
};