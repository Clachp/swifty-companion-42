export interface User42 {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name: string;
  usual_first_name: string | null;
  url: string;
  phone: string | null;
  displayname: string;
  kind: string;
  image: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
  staff?: boolean;
  correction_point: number;
  pool_month: string | null;
  pool_year: string | null;
  location: string | null;
  wallet: number;
  anonymize_date: string;
  data_erasure_date: string | null;
  created_at: string;
  updated_at: string;
  alumnized_at: string | null;
  alumni?: boolean;
  active?: boolean;
  cursus_users: CursusUser[];
  projects_users: ProjectUser[];
  campus: Campus[];
}

export interface CursusUser {
  id: number;
  grade: string | null;
  level: number;
  skills: Skill[];
  blackholed_at: string | null;
  cursus_id: number;
  has_coalition: boolean;
  created_at: string;
  updated_at: string;
  cursus: {
    id: number;
    created_at: string;
    name: string;
    slug: string;
  };
}

export interface Skill {
  id: number;
  name: string;
  level: number;
}

export interface ProjectUser {
  id: number;
  occurrence: number;
  final_mark: number | null;
  status: 'finished' | 'in_progress' | 'searching_a_group' | 'creating_group';
  validated?: boolean;
  current_team_id: number | null;
  project: {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
  };
  cursus_ids: number[];
  marked_at: string | null;
  marked: boolean;
  retriable_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campus {
  id: number;
  name: string;
  time_zone: string;
  language: {
    id: number;
    name: string;
    identifier: string;
    created_at: string;
    updated_at: string;
  };
  users_count: number;
  country: string;
  address: string;
  zip: string;
  city: string;
  website: string;
  active: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}