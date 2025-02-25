import { helpers } from "@vuelidate/validators";

const specialCharList = ["@", "$", "!", "%", "*", "?", "&", "#", "(" ,")", '"', "'", ":", ";", ",", "."];

export const usernameValidation = helpers.withMessage(
    "- Must contain letters, numbers, and underscores.",
    (value: string) => /^[a-zA-Z0-9_]+$/.test(value)
);

export const displaynameLength = helpers.withMessage(
    "- Display name must be up to 32 characters long.",
    (value: string) => value?.length <= 32
);

export const usernameLength = helpers.withMessage(
    "- Username must be 3-32 characters long.",
    (value: string) => value?.length >= 3 && value?.length <= 32
);

export const mailValidation = helpers.withMessage(
    "- Invalid email address.",
    (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
);

export const minLengthRule = helpers.withMessage(
    "- At least 8 characters long.",
    (value: string) => value?.length >= 8
);

export const uppercaseRule = helpers.withMessage(
    "- At least one uppercase letter.",
    (value: string) => /[A-Z]/.test(value)
);

export const lowercaseRule = helpers.withMessage(
    "- At least one lowercase letter.",
    (value: string) => /[a-z]/.test(value)
);

export const digitRule = helpers.withMessage(
    "- At least one number.",
    (value: string) => /\d/.test(value)
);

export const specialCharRule = helpers.withMessage(
    "- At least one special character (" + specialCharList.join('') + ").",
    (value: string) => hasSpecialChar(value)
);

function hasSpecialChar(value: string) : boolean {
    return specialCharList.some((char) => value.includes(char));
}

export const validateServer = (terms: boolean, displayname: string, username: string, email: string, password: string, confirm_password: string): Record<string, string | null> | null => {
    const errors: Record<string, string | null> = {};


    if (!terms) {
        throw createError({ statusCode: 400, data: { message: "You must agree to the terms of service." } });
    }

    if (!displayname || !username || !email || !password || !confirm_password) {
        throw createError({ statusCode: 400, data: { message: "Missing required fields." } });
    }


    if (!displayname || displayname.length > 32) {
        errors.display_name = "- Must be at most 32 characters long.";
    }

    if (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = "- Must be at least 3 characters, contain only letters, numbers, and underscores.";
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = "- Invalid email address.";
    }

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[@$!%*?&#]/.test(password)) {
        errors.password = "Password does not meet security requirements.";
        errors.password += !/[A-Z]/.test(password) ? "At least one uppercase letter." : "";
        errors.password += !/[a-z]/.test(password) ? "At least one lowercase letter." : "";
        errors.password += !/\d/.test(password) ? "At least one number." : "";
        errors.password +=  hasSpecialChar(password) ? "At least one special character (" + specialCharList.join('') + ")." : "";
    }

    return Object.keys(errors).length > 0 ? errors : null;
};
