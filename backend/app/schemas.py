from pydantic import BaseModel, EmailStr, Field


class ProfileLinks(BaseModel):
    email: str = ""
    github: str = ""
    linkedin: str = ""


class Profile(BaseModel):
    name: str
    title: str
    location: str
    email: EmailStr
    phone: str
    years_experience: float
    summary: str
    links: ProfileLinks


class SkillGroup(BaseModel):
    group: str
    items: list[str]


class Experience(BaseModel):
    title: str
    company: str
    location: str
    start: str
    end: str
    current: bool = False
    bullets: list[str]


class TechGroup(BaseModel):
    group: str
    items: list[str]


class ArchitectureStage(BaseModel):
    label: str
    detail: str
    branches: list[str] = []


class ProjectDetails(BaseModel):
    problem: str
    approach: list[str]
    tech: list[TechGroup]
    architecture: list[ArchitectureStage]
    outcomes: list[str] = []


class Project(BaseModel):
    id: str
    name: str
    tagline: str
    description: str
    tags: list[str]
    role: str
    details: ProjectDetails | None = None


class OtherProject(BaseModel):
    name: str
    category: str
    description: str


class Education(BaseModel):
    degree: str
    institution: str
    start: str
    end: str
    highlights: list[str] = []


class LanguageSpoken(BaseModel):
    name: str
    level: str


class ResumeBundle(BaseModel):
    profile: Profile
    skills: list[SkillGroup]
    experience: list[Experience]
    projects: list[Project]
    other_projects: list[OtherProject] = []
    education: list[Education]
    languages_spoken: list[LanguageSpoken] = []


class ContactMessageIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    message: str = Field(min_length=5, max_length=4000)


class ContactMessageOut(BaseModel):
    id: int
    received: bool = True

