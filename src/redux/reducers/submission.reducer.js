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
        title: submissionInfo.title || "Submission Forms"
      };
      _.map(_.get(submissionInfo, "form.leaf"), leaf => {
        const title = leaf.title;
        const folderName = title.substring(0, title.lastIndexOf(" "));
        subInfo = {
          ...subInfo,
          [folderName]: {
            leaf: {
              ...leaf
            },
            title: folderName
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

  let regionalData = _.get(data, "[fda-regional:fda-regional][m1-regional]");
  if (regionalData) {
    regionalData = _.omit(regionalData, "leaf");
    m1Regional = {
      ...m1Regional,
      ...regionalData
    };
  }
  const m1 = {
    "m1-administrative-information-and-prescribing-information": {
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
  const label = _.get(
    admin,
    "[application-set][application][application-information][application-number][$t]"
  );
  data["ectd:ectd"] = {
    ...m1,
    ..._.omit(
      data["ectd:ectd"],
      "m1-administrative-information-and-prescribing-information"
    ),
    label
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
