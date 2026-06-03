import Joi from 'joi';

/**
 * Joi schema for a single SoundCard data item.
 */
const soundCardSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': '"id" must not be empty',
    'any.required': '"id" is required',
  }),
  label: Joi.string().required().messages({
    'string.empty': '"label" must not be empty',
    'any.required': '"label" is required',
  }),
  type: Joi.string().valid('vowel', 'consonant').required().messages({
    'any.only': '"type" must be either "vowel" or "consonant"',
    'any.required': '"type" is required',
  }),
  group: Joi.string().required().messages({
    'string.empty': '"group" must not be empty',
    'any.required': '"group" is required',
  }),
  targetLabel: Joi.string().valid(
    'a',
    'i',
    'u',
    'e',
    'o',
    'ba',
    'bi',
    'bu',
    'be',
    'bo',
    'pa',
    'pi',
    'pu',
    'pe',
    'po',
    'ma',
    'mi',
    'mu',
    'me',
    'mo'
  ).required().messages({
    'any.only': '"targetLabel" must be one of the supported syllables',
    'any.required': '"targetLabel" is required',
  }),
});

/**
 * Joi schema for an array of SoundCard data items.
 */
const syllablesArraySchema = Joi.array().items(soundCardSchema).min(1).messages({
  'array.min': 'Syllables array must contain at least 1 item',
});

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .max(255)
  .required()
  .messages({
    'string.email': 'Format email tidak valid.',
    'string.empty': 'Email wajib diisi.',
    'string.max': 'Email maksimal 255 karakter.',
    'any.required': 'Email wajib diisi.',
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/\d/, 'number')
  .required()
  .messages({
    'string.empty': 'Password wajib diisi.',
    'string.min': 'Password minimal 8 karakter.',
    'string.max': 'Password maksimal 72 karakter.',
    'string.pattern.name': 'Password harus mengandung huruf dan angka.',
    'any.required': 'Password wajib diisi.',
  });

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'string.empty': 'Password wajib diisi.',
    'any.required': 'Password wajib diisi.',
  }),
});

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Nama wajib diisi.',
    'string.min': 'Nama minimal 3 karakter.',
    'string.max': 'Nama maksimal 255 karakter.',
    'any.required': 'Nama wajib diisi.',
  }),
  email: emailSchema,
  password: passwordSchema,
});

const profileSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Nama wajib diisi.',
    'string.min': 'Nama minimal 3 karakter.',
    'string.max': 'Nama maksimal 255 karakter.',
    'any.required': 'Nama wajib diisi.',
  }),
  email: emailSchema,
});

function firstError(error) {
  return error?.details?.[0]?.message || null;
}

/**
 * Validates a single sound card data object.
 * @param {object} data - The sound card data to validate.
 * @returns {{ error: object|null, value: object }} Joi validation result.
 */
export function validateSoundCard(data) {
  return soundCardSchema.validate(data, { abortEarly: false });
}

/**
 * Validates an array of sound card data objects.
 * @param {Array} data - The array of sound card data to validate.
 * @returns {{ error: object|null, value: Array }} Joi validation result.
 */
export function validateSyllables(data) {
  return syllablesArraySchema.validate(data, { abortEarly: false });
}

export function validateLoginForm(data) {
  const result = loginSchema.validate(data, { abortEarly: false });
  return { ...result, message: firstError(result.error) };
}

export function validateRegisterForm(data) {
  const result = registerSchema.validate(data, { abortEarly: false });
  return { ...result, message: firstError(result.error) };
}

export function validateProfileForm(data) {
  const result = profileSchema.validate(data, { abortEarly: false });
  return { ...result, message: firstError(result.error) };
}

export { soundCardSchema, syllablesArraySchema, loginSchema, registerSchema, profileSchema };
