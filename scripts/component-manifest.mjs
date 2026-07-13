import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const slugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u

export const flattenComponentManifest = (manifest) =>
  manifest.groups.flatMap((group) =>
    group.components.map((component) => ({
      ...component,
      category: group.id,
      categoryLabel: group.label,
    })),
  )

export const readComponentManifest = async (repositoryRoot) => {
  const path = resolve(repositoryRoot, 'packages/ui/component-manifest.json')
  const manifest = JSON.parse(await readFile(path, 'utf8'))

  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.groups)) {
    throw new Error('component manifest must use schemaVersion 1 and contain groups')
  }

  const groupIds = new Set()
  const slugs = new Set()

  for (const group of manifest.groups) {
    if (!slugPattern.test(group.id) || typeof group.label !== 'string' || !group.label.trim()) {
      throw new Error('component manifest contains an invalid group')
    }
    if (groupIds.has(group.id)) throw new Error('duplicate component group: ' + group.id)
    if (!Array.isArray(group.components) || group.components.length === 0) {
      throw new Error('component group must not be empty: ' + group.id)
    }
    groupIds.add(group.id)

    for (const component of group.components) {
      if (!slugPattern.test(component.slug)) {
        throw new Error('invalid component slug: ' + String(component.slug))
      }
      if (typeof component.label !== 'string' || !component.label.trim()) {
        throw new Error('component label must not be empty: ' + component.slug)
      }
      if (slugs.has(component.slug)) throw new Error('duplicate component slug: ' + component.slug)
      slugs.add(component.slug)
    }
  }

  return manifest
}

export const compareExactSets = (actual, expected) => {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)

  return {
    missing: [...expectedSet].filter((value) => !actualSet.has(value)).sort(),
    extra: [...actualSet].filter((value) => !expectedSet.has(value)).sort(),
  }
}

export const pushExactSetErrors = (errors, label, actual, expected) => {
  const { missing, extra } = compareExactSets(actual, expected)
  if (missing.length > 0) errors.push(label + ' missing: ' + missing.join(', '))
  if (extra.length > 0) errors.push(label + ' extra: ' + extra.join(', '))
}
