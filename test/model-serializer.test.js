import { expect } from 'chai';
import { JSONAPIRecord } from '../dist';

describe('JSONAPI Model Serializer', () => {
  const recordStub = (overrides = {}) => new JSONAPIRecord({
    specification: {
      type: 'person',
      attributes: ['name', 'age', 'gender'],
    },
    id: 3,
    name: 'Ali',
    age: 29,
    gender: 'male',
    ...overrides,
  });

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
        attributes: ['name', 'public_id'],
      },
      id: 2,
      name: 'Big Company Ltd',
      public_id: 'bcltd',
      mapper: {},
    });

    const record = recordStub({
      organisation: relationshipStub,
      mapper: {},
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

  it('can build a resource document with hasMany relationship', async () => {
    const relationshipStub = recordStub({
      specification: {
        type: 'child',
        attributes: ['name', 'age'],
      },
      id: 2,
      name: 'Child',
      age: 7,
      mapper: { relations: { belongsTo: { person: {} } } },
    });

    const record = recordStub({
      children: [relationshipStub],
      mapper: { relations: { hasMany: { child: {} } } },
    });

    const document = record.buildDocument({
      include: ['children'],
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
          children: {
            links: {
              self: `https://www.example.com/people/${record.id}/relationships/children`,
              related: `https://www.example.com/people/${record.id}/children`,
            },
            data: [
              {
                type: 'children',
                id: relationshipStub.id,
              },
            ],
          },
        },
      },
      included: [
        {
          id: relationshipStub.id,
          type: 'children',
          attributes: {
            name: relationshipStub.name,
            age: relationshipStub.age,
          },
        },
      ],
    });
  });
});
