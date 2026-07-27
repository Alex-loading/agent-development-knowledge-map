function valuesOf(registry) {
  if (registry instanceof Map) return [...registry.values()];
  if (!registry || typeof registry !== 'object') return [];
  return Object.values(registry);
}

function assetPathsFor(visual) {
  return [
    visual.assetPath,
    ...(visual.steps?.map((step) => step.assetPath) ?? []),
  ];
}

export async function validateKnowledgeVisualOwnership({
  courseRegistry,
  knowledgeVisuals,
  assetExists = async () => true,
}) {
  const errors = [];
  const placements = [];
  const visualsById = new Map();

  for (const visual of knowledgeVisuals ?? []) {
    if (visualsById.has(visual.id)) {
      errors.push(`${visual.id}: duplicate published visual ID`);
    } else {
      visualsById.set(visual.id, visual);
    }
  }

  for (const course of valuesOf(courseRegistry)) {
    const resourcesById = new Map(
      (course.resources ?? []).map((resource) => [resource.id, resource]),
    );
    for (const lesson of course.lessons ?? []) {
      const note = lesson.knowledgeNote ?? {};
      const sections = Array.isArray(note.sections) ? note.sections : [];
      const sectionsById = new Map(sections.map((section) => [section.id, section]));
      const overviewVisualId = note.overviewVisualId;
      const overviewSectionId = note.overviewVisualSectionId;

      if (overviewVisualId !== undefined || overviewSectionId !== undefined) {
        if (typeof overviewVisualId !== 'string' || overviewVisualId.length === 0) {
          errors.push(`${course.id}/${lesson.id}: overviewVisualId is required with overviewVisualSectionId`);
        }
        if (typeof overviewSectionId !== 'string' || overviewSectionId.length === 0) {
          errors.push(`${course.id}/${lesson.id}/${overviewVisualId}: overviewVisualSectionId is required`);
        }
        if (typeof overviewVisualId === 'string' && overviewVisualId.length > 0) {
          placements.push({
            courseId: course.id,
            lessonId: lesson.id,
            sectionId: overviewSectionId,
            kind: 'overview',
            visualId: overviewVisualId,
            lesson,
            ownerSection: sectionsById.get(overviewSectionId),
            resourcesById,
          });
        }
      }

      for (const section of sections) {
        for (const placement of section.visuals ?? []) {
          placements.push({
            courseId: course.id,
            lessonId: lesson.id,
            sectionId: section.id,
            kind: 'section',
            visualId: placement.visualId,
            lesson,
            ownerSection: section,
            resourcesById,
          });
        }
      }
    }
  }

  const placementCountByVisualId = new Map();
  for (const placement of placements) {
    placementCountByVisualId.set(
      placement.visualId,
      (placementCountByVisualId.get(placement.visualId) ?? 0) + 1,
    );
    const context = `${placement.courseId}/${placement.lessonId}/${placement.sectionId}/${placement.visualId}`;
    const visual = visualsById.get(placement.visualId);
    if (!visual) {
      errors.push(`${context}: placement does not resolve to a published visual`);
      continue;
    }
    if (!placement.ownerSection) {
      errors.push(`${context}: ${placement.sectionId} is not a real section`);
      continue;
    }

    for (const sourceId of visual.sourceIds ?? []) {
      if (!placement.lesson.resourceIds?.includes(sourceId)) {
        errors.push(`${context}/${sourceId}: source is outside lesson.resourceIds`);
      }
      if (!placement.resourcesById.get(sourceId)?.evidence) {
        errors.push(`${context}/${sourceId}: source lacks course evidence`);
      }
      if (!placement.ownerSection.sourceIds?.includes(sourceId)) {
        errors.push(`${context}/${sourceId}: source is outside owner section.sourceIds`);
      }
    }

    for (const assetPath of assetPathsFor(visual)) {
      if (typeof assetPath !== 'string' || assetPath.length === 0) {
        errors.push(`${context}: visual assetPath must be a non-empty string`);
        continue;
      }
      try {
        if (await assetExists(assetPath) === false) {
          errors.push(`${context}/${assetPath}: asset does not exist`);
        }
      } catch (error) {
        errors.push(`${context}/${assetPath}: asset check failed: ${error.message}`);
      }
    }
  }

  for (const visual of knowledgeVisuals ?? []) {
    const count = placementCountByVisualId.get(visual.id) ?? 0;
    if (count === 0) {
      errors.push(`${visual.id}: orphan published visual has 0 placements`);
    } else if (count !== 1) {
      errors.push(`${visual.id}: expected exactly 1 placement; found ${count} placements`);
    }
  }

  return {
    errors,
    placements,
  };
}
