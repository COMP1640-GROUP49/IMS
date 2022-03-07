/**
 * Got this from https://stackoverflow.com/a/32108184
 */

export const isEmptyOrUndefined = (obj: object) => {
	return (obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype) || obj === undefined;
};
