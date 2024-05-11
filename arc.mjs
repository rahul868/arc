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
import { permitValidations } from "./utils/uitlsfunc.mjs";
// Global config object which keep track of arc instance settings
const arcConfig = {
  adValidation: false,
  size: 1000,
};

function rtnError(msg) {
  return { success: false, msg };
}

function rtnSuccess() {
  return { success: true, msg: "Structure is as expected." };
}

/*
    Permit types are set of data types which are allowed in arc.
*/

const permitChilds = {
  obj: { nativeType: "object", allowed: { valueCheck: false } },
  arr: {
    nativeType: "array",
    allowed: {
      valueCheck: true,
    },
  },
  int: {
    nativeType: "number",
    allowed: {
      valueCheck: true,
    },
  },
  bool: {
    nativeType: "boolean",
    allowed: {
      valueCheck: true,
    },
  },
  str: {
    nativeType: "string",
    allowed: {
      valueCheck: true,
    },
  },
};

function checkTypes(type, node) {
  // Ex
  // type : "string"
  // node : "Rahul"
  if (!permitChilds[type]) {
    return {
      success: false,
      msg: `${type} Type not allowed. Please pass valid type.`,
    };
  }

  if (permitChilds[type]["nativeType"] == "array" && Array.isArray(node)) {
    return { success: true, msg: "Type validated!" };
  }

  if (permitChilds[type]["nativeType"] == typeof node) {
    // Type is validated.
    return {
      success: true,
      msg: "Type validated!",
      isValidationAllowed: permitChilds[type]["allowed"]["valueCheck"],
    };
  }

  // Default false rtn for invalid type.
  return {
    success: false,
    msg: `Type not matched. Expected ${type} but got ${typeof node}.`,
  };
}

function checkValue(node, vldArr) {
  console.log(node, vldArr);
  for (let i = 0; i < vldArr.length; i++) {
    if (permitValidations[vldArr[i]["name"]]) {
      const validationFunction = permitValidations[vldArr[i]["name"]];
      if (
        !validationFunction ||
        typeof validationFunction["callback"] !== "function"
      ) {
        continue;
      }
      return validationFunction["callback"](node, vldArr[i]["data"]);
    }
  }
  return { success: true };
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
  let { type, name, childs, validations } = nodeObj;
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

  /*
    Since type is validated we can process for validation step
    We have already get signal for validation allowed or not from above
    checkTypes call. (property name : isValidationAllowed)
  */
  console.log(typeStatus["isValidationAllowed"]);
  if (typeStatus["isValidationAllowed"]) {
    if (validations) {
      if (Array.isArray(validations)) {
        if (validations.length > 0) {
          let vldStatus = checkValue(currObj[name], validations);
          console.log(vldStatus);
          if (!vldStatus.success) {
            return rtnError(vldStatus.msg);
          }
        }
      } else {
        return rtnError(
          `Validations for ${name} should be an array of objects.`
        );
      }
    }
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
  if (!root || !data) {
    return rtnError("Invalid structure. root and data object is required.");
  }

  if (typeof root != "object" || typeof data != "object") {
    return rtnError("Invalid structure. root and data must be object.");
  }

  // Check is multiple properties are exist in root level.
  let isMltrt = objNestingTest(root);
  if (isMltrt) {
    let modRoot = { name: "data", type: "obj", childs: root.childs };
    let modData = { data: data };
    return validateIndividualNode(modRoot, modData);
  }
  return validateIndividualNode(root, data);
}

function arc(config) {
  // arcConfig = { ...arcConfig, ...config };
  // console.log(arcConfig);
  // Encapsulation of private functions and properties , to outside world.
  // Will only return function which are allowed to access for outside modules.
  return {
    arcInit: validateCommand,
    arcTypes: permitChilds,
  };
}

export { arc };
