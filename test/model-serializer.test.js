import { expect } from 'chai';
import sinon from 'sinon';
import { JSONAPIRecord } from '../dist';

describe('JSONAPI Model Serializer', () => {
  const recordStub = function(overrides = {}) {
    return new JSONAPIRecord({
      specification: {
        type: 'person',
        attributes: ['name', 'age', 'gender']
      },
      id: 3,
      name: 'Ali',
      age: 29,
      gender: 'male',
      ...overrides
    });
  };

  it('can build a resource document', async () => {
    const record = recordStub();
    expect(record.buildDocument()).to.deep.equal({
      data: {
        id: record.id,
        type: 'people',
        attributes: {
          name: record.name,
          age: record.age,
          gender: record.gender,
        },
      },
    });
  });

  it('can build a resource document with belongsTo relationship', async () => {
    const relationshipStub = recordStub({
      specification: {
        type: 'organisation',
        attributes: ['name', 'public_id']
      },
      id: 2,
      name: 'Big Company Ltd',
      public_id: 'bcltd',
      mapper: sinon.createStubInstance(function() { return { relations: {} } })
    });
    expect(relationshipStub.id).to.equal(2);

    const record = recordStub({
      organisation: relationshipStub,
      mapper: sinon.createStubInstance(function() {
        return {
          relations: {
            belongsTo: {
              organisation: {
                foreignKey: 'organisation_id',
                localField: 'organisation'
              },
            },
          },
        };
      }),
      organisation_id: 2,
    });

    const document = record.buildDocument({
      include: ['organisation'],
      baseUrl: 'https://www.example.com',
    });

    expect(document).to.deep.equal({
      data: {
        id: record.id,
        type: 'people',
        attributes: {
          name: record.name,
          age: record.age,
          gender: record.gender,
        },
        relationships: {
          organisation: {
            links: {
              self: `https://www.example.com/people/${record.id}/relationships/organisation`,
              related: `https://www.example.com/people/${record.id}/organisation`,
            },
            data: {
              type: 'organisations',
              id: relationshipStub.id,
            },
          },
        },
      },
      included: [
        {
          id: relationshipStub.id,
          type: 'organisations',
          attributes: {
            name: relationshipStub.name,
            public_id: relationshipStub.public_id,
          },
        },
      ],
    });
  });

});
