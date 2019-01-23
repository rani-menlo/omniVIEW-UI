import { SubmissionActionTypes } from "../actionTypes";

const initialState = {
  sequences: [],
  selectedSequence: null,
  jsonData: null,
  validations: []
};

const addM1RegionalData = data => {
  let m1Regional = {};
  const admin = data["fda-regional:fda-regional"].admin;
  if (admin) {
    const submissionInfo = _.get(
      admin,
      "[application-set][application][submission-information]"
    );
    if (submissionInfo) {
      let subInfo = {
        name: submissionInfo.name || "",
        title: submissionInfo.title || ""
      };
      _.map(_.get(submissionInfo, "form.leaf"), leaf => {
        const title = leaf.title;
        const folderName = title.substring(0, title.lastIndexOf(" "));
        subInfo = {
          ...subInfo,
          [folderName]: {
            leaf: {
              ...leaf
            }
          }
        };
      });
      m1Regional = {
        ...m1Regional,
        "submission-information": {
          ...subInfo
        }
      };
    }
  }
  const m1 = {
    "m1-administrative-information-and-prescribing-information ": {
      name: "m1-administrative-information-and-prescribing-information",
      folder: "m1",
      title: "Administrative Information and Prescribing Information",
      "m1-regional": {
        name: "m1-regional",
        folder: "us",
        title: "US Regional",
        ...m1Regional
      }
    }
  };
  data["ectd:ectd"] = {
    ...m1,
    ...data["ectd:ectd"]
  };
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SubmissionActionTypes.FETCH_SEQUENCES: {
      return {
        ...state,
        sequences: action.data.data
      };
    }
    case SubmissionActionTypes.FETCH_SEQUENCE_JSON:
    case SubmissionActionTypes.FETCH_LIFE_CYCLE_JSON: {
      let data = action.data;
      addM1RegionalData(data);
      return {
        ...state,
        jsonData: data
      };
    }
    case SubmissionActionTypes.SET_SELECTED_SEQUENCE: {
      return {
        ...state,
        selectedSequence: action.sequence
      };
    }
    case SubmissionActionTypes.VALIDATE_SEQUENCE: {
      return {
        ...state,
        validations: action.data.data
      };
    }
    default:
      return state;
  }
};
