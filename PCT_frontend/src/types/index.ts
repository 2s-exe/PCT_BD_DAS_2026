// ============================================================
// Types TypeScript — PCT UVCI
// ============================================================

export type Role = "admin" | "secretaire" | "enseignant";

export interface User {
  id: number;
  login: string;
  role: Role;
  enseignant?: Enseignant;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Departement {
  id: number;
  nom_departement: string;
  responsable?: string;
}

export interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  grade: "Assistant" | "Maitre-Assistant" | "Professeur";
  statut: "Permanent" | "Vacataire";
  taux_horaire: number;
  actif: boolean;
  departement?: Departement;
  created_at: string;
}

export interface AnneeAcademique {
  id: number;
  libelle_annee: string;
  date_debut: string;
  date_fin: string;
  active: boolean;
}

export interface Cours {
  id: number;
  intitule_ecue: string;
  niveau: "L1" | "L2" | "L3" | "M1" | "M2";
  semestre: string;
  credit_ecue: number;
  code_specialite?: string;
  charge_horaire_annuel: number;
}

export interface Attribution {
  id: number;
  charge_horaire: number;
  date_attribution: string;
  enseignant: Enseignant;
  cours: Cours;
  annee: AnneeAcademique;
}

export interface ParametreCalcul {
  id: number;
  type_operation: "creation" | "mise_a_jour";
  niveau_complexite: "simple" | "intermediaire" | "complexe";
  coefficient_vhn: number;
  description?: string;
}

export interface ActivitePedagogique {
  id: number;
  type_operation: "creation" | "mise_a_jour";
  niveau_complexite: "simple" | "intermediaire" | "complexe";
  date_activite: string;
  volume_horaire: number;
  observations?: string;
  attribution: Attribution;
  annee: AnneeAcademique;
}

export interface VolumeHoraire {
  id: number;
  heures_prevues: number;
  heures_realisees: number;
  heures_complementaires: number;
  enseignant: Enseignant;
  annee: AnneeAcademique;
  validation?: Validation;
}

export interface Validation {
  id: number;
  statut_validation: "en_attente" | "valide" | "rejete";
  date_validation?: string;
  observations?: string;
}

export interface Secretaire {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  login: string;
  actif: boolean;
  created_at: string;
}

export interface Utilisateur {
  id: number;
  login: string;
  actif: boolean;
  profil: { id: number; libelle_profil: Role };
  enseignant?: Enseignant;
}

// Réponse paginée Laravel
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Réponse API standard
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
