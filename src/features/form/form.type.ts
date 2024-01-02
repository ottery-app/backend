import { FormFlag } from "./form.flag.enum";
import { FormField } from "./form.schema";

export type FormFieldMap = {
    [key in FormFlag]: FormField[];
};