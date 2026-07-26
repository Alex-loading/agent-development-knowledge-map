export const VISUAL_KINDS = Object.freeze([
  'diagram',
  'source-figure',
  'step-diagram',
]);

export const VISUAL_PROVENANCE = Object.freeze([
  'original-synthesis',
  'licensed-reproduction',
  'licensed-adaptation',
  'official-media',
]);

export const VISUAL_ROLES = Object.freeze([
  'overview',
  'mechanism',
  'process',
  'relationship',
  'comparison',
  'boundary',
  'failure',
  'decision',
]);

export const VISUAL_TAGS = Object.freeze([
  'mechanism',
  'process',
  'comparison',
  'boundary',
  'decision',
  'relationship',
  'failure-mode',
  'tradeoff',
]);

const PERMISSION_BASES = Object.freeze([
  'license',
  'public-domain',
  'official-media-policy',
]);

const VISUAL_ID = /^visual-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STEP_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASSET_SEGMENT = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;
const ASSET_EXTENSION = /\.(svg|webp|png|jpeg)$/;

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function matchesPattern(value, pattern) {
  return isText(value) && pattern.test(value);
}

function isValidDate(value) {
  if (!isText(value)) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year === 0 || month < 1 || month > 12) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysByMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day >= 1 && day <= daysByMonth[month - 1];
}

function isHttpsUrl(value) {
  if (
    !matchesPattern(value, /^https:\/\/[^/\s]+(?:\/|$)/)
  ) {
    return false;
  }
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:'
      && url.hostname.length > 0
      && url.username === ''
      && url.password === ''
    );
  } catch {
    return false;
  }
}

function isSafeLocalAssetPath(value) {
  if (
    !isText(value)
    || value !== value.trim()
    || value.includes('\\')
    || value.includes('..')
    || value.includes('?')
    || value.includes('#')
    || value.includes('%')
    || /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return false;
  }

  const segments = value.split('/');
  if (
    segments.length < 3
    || segments[0] !== 'assets'
    || segments[1] !== 'visuals'
    || segments.some(
      (segment) =>
        segment.length === 0
        || segment === '.'
        || segment === '..'
        || !ASSET_SEGMENT.test(segment),
    )
  ) {
    return false;
  }

  return ASSET_EXTENSION.test(segments.at(-1));
}

function assetDirectory(assetPath) {
  return assetPath.slice(0, assetPath.lastIndexOf('/'));
}

function assetExtension(assetPath) {
  return assetPath.slice(assetPath.lastIndexOf('.') + 1);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

function freezePlainValue(value, seen) {
  if (!Array.isArray(value) && !isPlainObject(value)) return value;
  if (seen.has(value)) return value;
  seen.add(value);

  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && 'value' in descriptor) {
      freezePlainValue(descriptor.value, seen);
    }
  }
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export function deepFreezeVisual(value) {
  return freezePlainValue(value, new WeakSet());
}

export function validateVisualAsset(asset) {
  const errors = [];
  const record = isPlainObject(asset) ? asset : {};

  if (!isPlainObject(asset)) errors.push('visual asset must be a plain object');

  for (const field of [
    'id',
    'role',
    'title',
    'alt',
    'longDescription',
    'caption',
    'assetPath',
    'provenance',
    'verifiedAt',
  ]) {
    if (!isText(record[field])) errors.push(`${field} is required`);
  }

  if (!Number.isInteger(record.width) || record.width <= 0) {
    errors.push('width must be a positive integer');
  }
  if (!Number.isInteger(record.height) || record.height <= 0) {
    errors.push('height must be a positive integer');
  }
  if (!matchesPattern(record.id, VISUAL_ID)) {
    errors.push('id must be stable kebab-case beginning with visual-');
  }
  if (!VISUAL_KINDS.includes(record.kind)) {
    errors.push('kind is not allowed');
  }
  if (!VISUAL_ROLES.includes(record.role)) {
    errors.push('role is not allowed');
  }
  if (!VISUAL_PROVENANCE.includes(record.provenance)) {
    errors.push('provenance is not allowed');
  }
  if (!isSafeLocalAssetPath(record.assetPath)) {
    errors.push(
      'assetPath must be a safe local visual asset under assets/visuals/',
    );
  }
  if (!isValidDate(record.verifiedAt)) {
    errors.push('verifiedAt must be a valid YYYY-MM-DD calendar date');
  }

  if (
    !Array.isArray(record.sourceIds)
    || record.sourceIds.length === 0
    || record.sourceIds.some((sourceId) => !isText(sourceId))
  ) {
    errors.push('sourceIds must be a non-empty array of non-empty strings');
  } else if (duplicateValues(record.sourceIds).size > 0) {
    errors.push('sourceIds must contain unique values');
  }

  if (record.tags !== undefined) {
    if (!Array.isArray(record.tags)) {
      errors.push('tags must be an array');
    } else {
      if (record.tags.some((tag) => !VISUAL_TAGS.includes(tag))) {
        errors.push('every tag must be allowed');
      }
      if (duplicateValues(record.tags).size > 0) {
        errors.push('tags must contain unique values');
      }
      const primaryTag = record.role === 'failure' ? 'failure-mode' : record.role;
      if (record.tags.includes(primaryTag)) {
        errors.push('a tag must not repeat the primary role');
      }
    }
  }

  if (record.provenance === 'original-synthesis') {
    if (!isText(record.credit)) {
      errors.push('credit is required for original-synthesis');
    }
    if (record.permission !== undefined && record.permission !== null) {
      errors.push('original-synthesis must not claim source permission');
    }
  }

  const sourcedProvenance = (
    VISUAL_PROVENANCE.includes(record.provenance)
    && record.provenance !== 'original-synthesis'
  );
  if (sourcedProvenance) {
    if (record.kind !== 'source-figure') {
      errors.push('sourced provenance requires source-figure kind');
    }
    for (const field of [
      'creator',
      'sourceUrl',
      'sourceFigure',
      'retrievedAt',
    ]) {
      if (!isText(record[field])) {
        errors.push(`${field} is required for sourced figures`);
      }
    }
    if (!isHttpsUrl(record.sourceUrl)) {
      errors.push('sourceUrl must be a valid HTTPS URL');
    }
    if (!isValidDate(record.retrievedAt)) {
      errors.push('retrievedAt must be a valid YYYY-MM-DD calendar date');
    }

    const permission = isPlainObject(record.permission)
      ? record.permission
      : {};
    if (!isPlainObject(record.permission)) {
      errors.push('permission must be a plain object for sourced figures');
    }
    if (!PERMISSION_BASES.includes(permission.basis)) {
      errors.push('permission basis is not allowed');
    }
    if (!isText(permission.name)) {
      errors.push('permission name is required');
    }
    if (!isHttpsUrl(permission.url)) {
      errors.push('permission URL must use valid HTTPS');
    }
    if (permission.allowsRedistribution !== true) {
      errors.push('explicit redistribution permission is required');
    }
    if (
      record.provenance === 'official-media'
      && permission.basis !== 'official-media-policy'
    ) {
      errors.push(
        'official-media requires an official-media-policy permission basis',
      );
    }

    if (!Array.isArray(record.modifications)) {
      errors.push('modifications must be recorded as an array');
    } else {
      if (record.modifications.some((modification) => !isText(modification))) {
        errors.push('every modification must be a non-empty string');
      }
      if (
        record.modifications.length > 0
        && permission.allowsModification !== true
      ) {
        errors.push('explicit modification permission is required');
      }
      if (
        record.provenance === 'licensed-adaptation'
        && record.modifications.length === 0
      ) {
        errors.push(
          'licensed-adaptation requires at least one recorded modification',
        );
      }
    }
  }

  if (record.kind === 'step-diagram') {
    if (record.provenance !== 'original-synthesis') {
      errors.push('step-diagram must use original-synthesis provenance');
    }
    if (!Array.isArray(record.steps) || record.steps.length < 2) {
      errors.push('step-diagram requires at least two steps');
    }

    if (Array.isArray(record.steps)) {
      const stepIds = [];
      const stepAssetPaths = [];
      for (const [index, stepValue] of record.steps.entries()) {
        const step = isPlainObject(stepValue) ? stepValue : {};
        if (!isPlainObject(stepValue)) {
          errors.push(`steps[${index}] must be a plain object`);
        }
        for (const field of ['id', 'title', 'description', 'alt', 'assetPath']) {
          if (!isText(step[field])) {
            errors.push(`steps[${index}].${field} is required`);
          }
        }
        if (!matchesPattern(step.id, STEP_ID)) {
          errors.push(`steps[${index}].id must be stable kebab-case`);
        }
        if (!isSafeLocalAssetPath(step.assetPath)) {
          errors.push(
            `steps[${index}].assetPath must be a safe local visual asset`,
          );
        }
        if (isText(step.id)) stepIds.push(step.id);
        if (isText(step.assetPath)) stepAssetPaths.push(step.assetPath);
      }

      if (duplicateValues(stepIds).size > 0) {
        errors.push('step ids must be unique');
      }
      if (duplicateValues(stepAssetPaths).size > 0) {
        errors.push('step asset paths must be unique');
      }

      if (isSafeLocalAssetPath(record.assetPath)) {
        for (const stepAssetPath of stepAssetPaths) {
          if (!isSafeLocalAssetPath(stepAssetPath)) continue;
          if (stepAssetPath === record.assetPath) {
            errors.push('step asset path must not duplicate the main assetPath');
          }
          if (
            assetDirectory(stepAssetPath)
            !== assetDirectory(record.assetPath)
          ) {
            errors.push('step assets must use the same directory as the main asset');
          }
          if (
            assetExtension(stepAssetPath)
            !== assetExtension(record.assetPath)
          ) {
            errors.push('step assets must use the same format as the main asset');
          }
        }
      }
    }
  }

  return errors;
}
