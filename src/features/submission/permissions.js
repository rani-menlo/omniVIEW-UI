import _ from "lodash";

export class Permissions {
  static GRANTED = {
    file_ids: new Set(),
    submission_ids: new Set(),
    sequence_ids: new Set()
  };
  static REVOKED = {
    file_ids: new Set(),
    submission_ids: new Set(),
    sequence_ids: new Set()
  };

  static clear() {
    Permissions.GRANTED.file_ids.clear();
    Permissions.GRANTED.submission_ids.clear();
    Permissions.GRANTED.sequence_ids.clear();
    Permissions.REVOKED.file_ids.clear();
    Permissions.REVOKED.submission_ids.clear();
    Permissions.REVOKED.sequence_ids.clear();
  }

  static hasChanges() {
    let size = 0;
    /*_.map(Permissions.GRANTED, (val, key) => {
      size += val.size;
    });
    if (!size) {
      _.map(Permissions.REVOKED, (val, key) => {
        size += val.size;
      });
    } */

    size = Permissions.GRANTED.file_ids.size;
    if (!size) {
      size = Permissions.REVOKED.file_ids.size;
    }
    return size !== 0;
  }
}
