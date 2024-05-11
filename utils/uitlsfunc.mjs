/*
    EACH NODE IN SCHEMA have some value associated with it.
    
    We are going to implement feature for checking exact value of specific
    property if it exist.
    Ex . {data:{type:"test"}}
    So if I need to check that name proeprty have test value received data , 
    this functionality will be useful..

    This strict value checking funcationality is only applicable to below TYPES:
    - Strings
    - Number
    - Boolean

    Thier is no sense for object strict value checking.


*/

function shouldBe(node, valueArr) {
  if (!valueArr || !Array.isArray(valueArr)) {
    return {
      success: false,
      msg: `Value checking is declined because valueArray is not provided.`,
    };
  }
  for (let k = 0; k < valueArr.length; k++) {
    if (node == valueArr[k]) {
      return {
        success: true,
        msg: `Value matched`,
      };
    }
  }

  return {
    success: false,
    msg: `${node} value is not matching with rececived and allowed values.`,
  };
}
const permitValidations = {
  shouldbe: { allowed: true, callback: shouldBe },
};
export { permitValidations };
