import { FormControl, ValidationErrors } from "@angular/forms";

export class Shop2GwaliorValidators {

    // WhiteSpace Validation
    static notOnlyWhitespace(control: FormControl) : ValidationErrors {
        // check if string only contains whitespace
        if((control.value != null) && (control.value.trim().length === 0)) {
            // invalid, return error object
            return { 'notOnlyWhitespace' : true };
        } else {
            // valid, return null
            return null;
        }
    }
}
