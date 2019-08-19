# JS-Data JSON API Serializer

Adds JSON:API serialization support to JS-Data Record & Mapper objects.

# INSTALLATION

NPM:

`npm i js-data-jsonapi-serializer`

# USAGE

Below you'll find instructions on how to use the classes provided by this
package in the JS-Data framework.

We will begin by setting up a JS-Data Container.

Notice that the Mapper we're going to define for our `user` resource will be
a custom mapper class (`UserMapper`), which will be our JSON:API extended class.

```
/* ./container.js */

import { Container } from 'js-data';
import UserMapper from './mapper/user';

const container = new Container();
container.registerAdapter(/* your chosen adapter config */);

container.defineMapper('user', {
  mapperClass: UserMapper,
  relations: { ... }
});
```

Now everytime we call `getMapper` on the container, we'll get back our JSON:API
extended mapper.

Lets see what the UserMapper class looks like:

```
/* ./mapper/user.js */

import { JSONAPIMapper } from 'js-data-jsonapi-serializer';
import UserModel from '../model/user';

class UserMapper extends JSONAPIMapper {
  constructor() {
    arguments[0].recordClass = UserModel;
    super(...arguments);
  }
}

export default UserMapper;
```

You'll notice the `recordClass` is set to a custom class too, here we called
it `UserModel`. It looks like this:

```
import { JSONAPIRecord } from 'js-data-jsonapi-serializer';

class UserModel extends JSONAPIRecord {
  get specification() {
    return {
      type: 'users',
      attributes: ['name', 'age', 'mobile_no'],
    };
  }
}

export default UserModel;
```

Couple things to note here:

Extension of the `JSONAPIRecord` class, which is a JS-Data Record.

Addition of the `specification` method. This defines the type of the
JSON:API resource as well as the attributes that will be present in
the payload for each record.

That's it! Now we're ready to start building JSON:API payloads.

```
/* Here we use Express as an example */

import express from 'express';

const router = express.Router();

router.get('/api/users/:id', async (req, res) => {
  const user = await container.getMapper('user').find(1);

  /*
     Get a JSON:API object of the user (simple JS object)
     and send that as your JSON payload
  */
  return res.json(user.buildDocument()).end();
});
```

# CLASSES

## JSONAPIMapper

This class extends the JS-Data `Mapper` class and adds the following methods.

### METHODS

#### buildDocuments(records, options = {})

Intended for use after calling the `findAll` JS-Data Mapper method and
passing in the returned records from that call.

Will build a JSON:API payload that returns an array of records.

Options is a object that can contain the following:

* include

  An array of relationships to include for each record. Note that whatever
  relationships you specify here should already have been loaded by
  having called `loadRelations` when fetching the records.

  See the lazy loading section in JS-Data for more information.

## JSONAPIRecord

This class extends the JS-Data `Record` class and adds the following methods.

#### mapper

Accessor method for the JS-Data `Record` private property `_mapper`. This is needed by the `JSONAPIMapper` class. Personally I think it should have been public anyway :)

#### specification

You are required to implement this accessor method. It should return an object with the follow properties:

* type

  The JSON:API type you want this type of record to have.

* attributes

  The attributes to include in the payload for this record.

#### buildDocument(options = {})

Builds a JSON:API document for this JS-Data `Record`.

The record will include 

* include

  An array of relationships to include for this record. Note that whatever
  relationships you specify here should already have been loaded by
  having called `loadRelations` when fetching the record.

  See the lazy loading section in JS-Data for more information.

* baseUrl

  Base (or root) URL of your API. Will be used to create link objects for this record in the JSON:API payload.

  If not given, the URLs returned will be relative.
