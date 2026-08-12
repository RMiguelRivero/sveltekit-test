import { z } from 'zod';

export function validateData<ZodSchema extends z.ZodTypeAny>(
	data: unknown,
	schema: ZodSchema,
): z.infer<ZodSchema> {
	const validationResult = schema.safeParse(data);
	if (!validationResult.success) {
		const issues = validationResult.error.issues
			.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
			.join('; ');
		throw new Error(`Schema validation failed for ${schema.meta()?.id || 'unknown'}: ${issues}`, {
			cause: validationResult.error,
		});
	}

	return validationResult.data;
}
