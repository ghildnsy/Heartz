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
});

/**
 * Joi schema for an array of SoundCard data items.
 */
const syllablesArraySchema = Joi.array().items(soundCardSchema).min(1).messages({
  'array.min': 'Syllables array must contain at least 1 item',
});

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

export { soundCardSchema, syllablesArraySchema };
