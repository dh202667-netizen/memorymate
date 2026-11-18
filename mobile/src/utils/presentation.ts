/** Resolve only bundled demo artwork; uploaded family photos keep their original source. */
export const demoFamilyPhoto = '/static/images/family-photo-v3.png'
export const demoStoryPhotos: Record<string, string> = {
  s1: demoFamilyPhoto,
  s2: '/static/images/story-piano.png',
  s3: '/static/images/story-autumn.png',
}
export function storyPhoto(src: string, storyId?: string) {
  const legacy = [
    '/static/images/family-photo.png',
    '/static/images/family-moment.svg',
    demoFamilyPhoto,
  ]
  return storyId && legacy.includes(src)
    ? (demoStoryPhotos[storyId] ?? displayPhoto(src))
    : displayPhoto(src)
}
export function displayPhoto(src: string) {
  return ['/static/images/family-photo.png', '/static/images/family-moment.svg'].includes(src)
    ? demoFamilyPhoto
    : src
}
export function isDemoPhoto(src: string) {
  return Object.values(demoStoryPhotos).includes(displayPhoto(src))
}
