import { Record } from 'js-data';
import _ from 'lodash';
import pluralize from 'pluralize';
import Ajv from 'ajv';

const _buildRelationshipLinkObject = Symbol('_buildRelationshipLinkObject');
const _buildRelationshipIncludes = Symbol('_buildRelationshipIncludes');
const _isHasManyRelationship = Symbol('_isHasManyRelationship');

class JSONAPIRecord extends Record {
  constructor() {
    super(...arguments);

    const ajv = new Ajv();
    const valid = ajv.validate(JSONAPIRecord.jsonapiSchema, this.specification);
    if (!valid) {
      throw new Error(
        `Specification error: ${ajv.errors.map((err) => `"${err.schemaPath}" => ${err.message}`).join(', ')}`,
      );
    }
  }

  static get jsonapiSchema() {
    return {
      type: 'object',
      properties: {
        type: {
          type: 'string',
        },
        attributes: {
          type: 'array',
          items: {
            type: 'string',
          },
          uniqueItems: true,
        },
      },
      required: ['type', 'attributes'],
    };
  }

  buildDocument(options = {}) {
    const { include } = options;
    const baseUrl = options.baseUrl || '';

    const attributes = {};
    this.specification.attributes.forEach((attr) => { attributes[attr] = this[attr]; });

    const document = {
      data: {
        id: this.id,
        type: pluralize.plural(this.specification.type),
        attributes,
      },
    };

    if (_.isEmpty(include)) {
      return document;
    }

    const relationships = {};
    document.included = [];
    include.forEach((name) => {
      const relationOptions = { baseUrl };
      let relation = name;
      let relationIncludes = [];
      if (_.isObject(name)) {
        [relation, relationIncludes] = _.flatten(_.toPairs(name));
        relationOptions.include = relationIncludes;
      }
      relationships[relation] = this[_buildRelationshipLinkObject](relation, baseUrl);
      this[_buildRelationshipIncludes](relation, relationOptions).forEach(
        (inc) => document.included.push(inc),
      );
    });
    document.data.relationships = relationships;

    return document;
  }

  [_buildRelationshipIncludes](relationName, options = {}) {
    const included = [];
    if (this[_isHasManyRelationship](this, relationName)) {
      this[relationName].forEach((record) => {
        const document = record.buildDocument(options);
        included.push(document.data);
        (document.included || []).forEach((include) => included.push(include));
      });
    } else {
      const document = this[relationName].buildDocument(options);
      included.push(document.data);
      (document.included || []).forEach((include) => included.push(include));
    }
    return included;
  }

  [_buildRelationshipLinkObject](relationName, baseUrl) {
    const relationship = this[relationName];
    const modelType = pluralize.plural(this.specification.type);
    const type = pluralize.plural(relationName);
    const links = {
      self: `${baseUrl}/${modelType}/${this.id}/relationships/${relationName}`,
      related: `${baseUrl}/${modelType}/${this.id}/${relationName}`,
    };

    if (this[_isHasManyRelationship](this, relationName)) {
      const data = relationship.map((relation) => ({ type, id: relation.id }));
      return { data, links };
    }

    const data = { type, id: relationship.id };
    return { data, links };
  }

  [_isHasManyRelationship](model, relationName) {
    if (_.hasIn(model.mapper.relations, `hasMany.${pluralize.singular(relationName)}`)) {
      return true;
    }
    return false;
  }
}

export default JSONAPIRecord;
