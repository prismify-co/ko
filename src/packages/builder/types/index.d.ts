export interface RecipeMeta {
  name: string
  description: string
  owner: string
  repo: RepoMeta
}

export interface RepoMeta {
  link: string
}
