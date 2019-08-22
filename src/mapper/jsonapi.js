import { Mapper } from 'js-data';
import _ from 'lodash';

class JSONAPIMapper extends Mapper {
  buildDocuments(records, options = {}) {
    const documents = { data: [] };
    const included = [];

    records.forEach((record) => {
      const document = record.buildDocument(options);
      documents.data.push(document.data);
      if (!_.isEmpty(document.included)) {
        document.included.forEach((include) => {
          if (!_.find(included, { id: include.id, type: include.type })) {
            included.push(include);
          }
        });
      }
    });

    if (!_.isEmpty(included)) {
      documents.included = included;
    }

    return documents;
  }
}

export default JSONAPIMapper;
