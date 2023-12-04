import { Type } from "@sinclair/typebox";

export const Status404 = {
  statusCode: 404,
  error: "Not found",
  message: "Record not found",
};

export const Status500 = {
  statusCode: 500,
  error: "Internal server error",
  message: "Something went wrong",
};

export const ErrorCodeType = Type.Object({
  statusCode: Type.Number(),
  error: Type.String(),
  message: Type.String(),
});
