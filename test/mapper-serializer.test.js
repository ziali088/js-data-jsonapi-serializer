import { expect } from 'chai';
import { JSONAPIRecord, JSONAPIMapper } from '../dist';

describe('JSONAPI Mapper Serializer', () => {
  const recordStub = (overrides = {}) => new JSONAPIRecord({
    specification: {
      type: 'person',
      attributes: ['name', 'age', 'gender'],
    },
    id: Math.floor(Math.random()),
    name: 'Ali',
    age: 29,
    gender: 'male',
    ...overrides,
  });

  it('can build resource documents', async () => {
    const records = [
      recordStub(),
      recordStub(),
    ];

    const mapper = new JSONAPIMapper({ name: 'person' });

    const documents = mapper.buildDocuments(records);
    expect(documents).to.deep.equal({
      data: [
        {
          id: records[0].id,
          type: 'people',
          attributes: {
            name: records[0].name,
            age: records[0].age,
            gender: records[0].gender,
          },
        },
        {
          id: records[1].id,
          type: 'people',
          attributes: {
            name: records[1].name,
            age: records[1].age,
            gender: records[1].gender,
          },
        },
      ],
    });
  });

  it('can build resource documents with included relationships', async () => {
    const mapper = new JSONAPIMapper({
      name: 'person',
      relations: {
        hasMany: { child: {} },
      },
    });

    const relationshipStub = recordStub({
      specification: {
        type: 'children',
        attributes: ['name', 'age'],
      },
      id: 2,
      name: 'Child',
      age: 7,
      _mapper: { relations: { belongsTo: { person: {} } } },
    });

    const records = [
      recordStub({
        children: [relationshipStub],
        _mapper: mapper
      }),
    ];

    const documents = mapper.buildDocuments(records, { include: ['children'] });
    expect(documents).to.deep.equal({
      data: [
        {
          id: records[0].id,
          type: 'people',
          attributes: {
            name: records[0].name,
            age: records[0].age,
            gender: records[0].gender,
          },
          relationships: {
            children: {
              links: {
                self: `/people/${records[0].id}/relationships/children`,
                related: `/people/${records[0].id}/children`,
              },
              data: [{ id: relationshipStub.id, type: 'children' }],
            },
          },
        },
      ],
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

  it('can build resource documents with nested relationships', async () => {
    const mapper = new JSONAPIMapper({
      name: 'person',
      relations: {
        hasMany: { child: {} },
      },
    });

    const childMapper = new JSONAPIMapper({
      name: 'child',
      relations: {
        belongsTo: { person: {} },
        hasMany: { toy: {} },
      },
    });

    const nestedRelationStub = recordStub({
      specification: {
        type: 'toy',
        attributes: ['name'],
      },
      id: 4,
      name: 'Toy',
      _mapper: { relations: { belongsTo: { child: {} } } },
    });

    const relationshipStub = recordStub({
      specification: {
        type: 'children',
        attributes: ['name', 'age'],
      },
      id: 2,
      name: 'Child',
      age: 7,
      _mapper: childMapper,
      toys: [nestedRelationStub],
    });

    const records = [
      recordStub({
        children: [relationshipStub],
        _mapper: mapper
      }),
    ];

    const documents = mapper.buildDocuments(records, { include: [{ children: ['toys'] }] });
    expect(documents).to.deep.equal({
      data: [
        {
          id: records[0].id,
          type: 'people',
          attributes: {
            name: records[0].name,
            age: records[0].age,
            gender: records[0].gender,
          },
          relationships: {
            children: {
              links: {
                self: `/people/${records[0].id}/relationships/children`,
                related: `/people/${records[0].id}/children`,
              },
              data: [{ id: relationshipStub.id, type: 'children' }],
            },
          },
        },
      ],
      included: [
        {
          id: relationshipStub.id,
          type: 'children',
          attributes: {
            name: relationshipStub.name,
            age: relationshipStub.age,
          },
          relationships: {
            toys: {
              data: [{
                id: nestedRelationStub.id,
                type: 'toys',
              }],
              links: {
                related: `/children/${relationshipStub.id}/toys`,
                self: `/children/${relationshipStub.id}/relationships/toys`,
              },
            },
          },
        },
        {
          id: nestedRelationStub.id,
          type: 'toys',
          attributes: {
            name: 'Toy',
          },
        },
      ],
    });
  });
});
