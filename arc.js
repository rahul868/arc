/*
  This function validates the response or any received object data from network resources or APIs in a recursive manner for better error handling.

  Schema structure:
  The schema is defined using an object that contains the root node of the expected structure.
  Each node in the schema must contain the following properties:
    - type: Expected data type of the property.
    - name: Name of the property.
    - childs: An optional array of child nodes.

  Utility functions:
  - rtnError: Returns an error object with a custom message.
  - rtnSuccess: Returns a success object indicating that the response is as expected.

  Functions:
  - validateChilds: Validates the child nodes of an object recursively.
  - validateIndividualNode: Validates an individual node against the schema.
  - validateCommand: Validates the overall structure of the received object against the expected schema.

  @param {Object} expectedSchema - The expected schema of the object data.
  @param {Object} currentObject - The object data to be validated against the schema.
  @returns {Object} - Returns a success object if the validation is successful, otherwise returns an error object.

*/

function rtnError(msg) {
  return { success: false, msg };
}

function rtnSuccess() {
  return { success: true, msg: "Response is as expected." };
}

/*
      Permit types are set of data types which are allowed in arc.
  */

const permitChilds = {
  obj: "object",
  arr: "array",
  int: "number",
  bool: "boolean",
  str: "string",
};

function checkTypes(type, node) {
  if (!permitChilds[type]) {
    return {
      success: false,
      msg: `${type} Type not allowed. Please pass valid type.`,
    };
  }

  if (permitChilds[type] == "array" && Array.isArray(node)) {
    return { success: true, msg: "Type validated!" };
  }

  if (permitChilds[type] == typeof node) {
    return { success: true, msg: "Type validated!" };
  }

  // Default false rtn for invalid type.
  return {
    success: false,
    msg: `Type not matched. Expected ${type} but got ${typeof node}.`,
  };
}

function objNestingTest(root) {
  let { type, name, childs } = root;
  if (childs && !type && !name) {
    return true;
  }
  return false;
}

function validateChilds(childArr, currObj) {
  // Recursive function to validate child nodes
  for (let c = 0; c < childArr.length; c++) {
    let status = validateIndividualNode(childArr[c], currObj);
    if (!status.success) {
      return status;
    }
  }
  return rtnSuccess();
}

function validateIndividualNode(nodeObj, currObj) {
  let { type, name, childs } = nodeObj;
  if (!type || !name) {
    return rtnError("Type and name properties are required in the root node.");
  }

  if (currObj[name] === undefined) {
    return rtnError(`${name} property does not exist.`);
  }

  let typeStatus = checkTypes(type, currObj[name]);
  if (!typeStatus.success) {
    return rtnError(typeStatus.msg);
  }

  if (childs) {
    if (Array.isArray(childs)) {
      if (childs.length > 0) {
        return validateChilds(childs, currObj[name]);
      }
    } else {
      return rtnError(
        `Property ${name} has invalid child type. Childs should be an array of objects.`
      );
    }
  }

  return rtnSuccess();
}

function validateCommand(scrut) {
  let { root, data } = scrut;
  console.log(root, data);
  if (!root || !data) {
    return rtnError("Invalid structure. root and data object is required.");
  }

  // Check is multiple properties are exist in root level.
  let isMltrt = objNestingTest(root);
  if (isMltrt) {
    let modRoot = { name: "data", type: "obj", childs: root.childs };
    let modData = { data: data };
    console.log(modData, modRoot);
    return validateIndividualNode(modRoot, modData);
  }
  return validateIndividualNode(root, data);
}

function arc() {
  // Encapsulation of private functions and properties , to outside world.
  // Will only return function which are allowed to access for outside modules.
  return {
    arcInit: validateCommand,
    arcTypes: permitChilds,
  };
}

let received = {
  mark: {
    coll: {
      id: 1,
      name: "John Doe",
      age: 30,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "12345",
      },
    },
  },
  //   contacts: [
  //     { type: "email", value: "john@example.com" },
  //     { type: "phone", value: "555-123-4567" },
  //   ],
};
let test = arc();

let expected = {
  type: "obj",
  name: "mark",
  childs: [
    {
      type: "obj",
      name: "coll",
      childs: [
        { type: "int", name: "id" },
        { type: "str", name: "name" },
        { type: "int", name: "age" },
        {
          type: "obj",
          name: "address",
          childs: [
            { type: "str", name: "street" },
            { type: "str", name: "city" },
            { type: "str", name: "state" },
          ],
        },
      ],
    },
  ],
};

console.log(test.arcInit({ root: expected, data: received }));

// export { validateCommand };
