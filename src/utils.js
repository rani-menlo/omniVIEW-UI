import _ from "lodash";

const isLoggedInOmniciaRole = role => _.get(role, "slug", "").includes("o_");

export { isLoggedInOmniciaRole };
