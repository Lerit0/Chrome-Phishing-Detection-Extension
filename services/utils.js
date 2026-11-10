export const getDomain = (email) => {
    const parts = email.split("@");
    if (parts.length < 2) return "";
    return parts[1].toLowerCase();
};
