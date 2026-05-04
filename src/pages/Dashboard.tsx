import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/Authcontext";

// ─── Interfaces ───────────────────────────────────────────────────────────────
// The individual record
export interface ProfileRecord {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
}

// The full API response
export interface ProfileApiResponse {
  status: string;
  metaData: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: ProfileRecord[];
}

export interface ProfileQuery {
  // Filters
  gender?: string;
  age_group?: string;
  country_id?: string;
  min_age?: string;
  max_age?: string;
  min_gender_probability?: string;
  min_country_probability?: string;
  // Sorting
  sort_by?: "age" | "created_at" | "gender_probability";
  order?: "asc" | "desc";
  // Pagination
  page?: string;
  limit?: string;
}


// ─── Main Dashboard ───────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [profile, setProfile] = useState<ProfileRecord[] | null>(null);
  const [metaData, setMetaData] = useState<ProfileApiResponse["metaData"] | null>(null);
  const [filters, setFilters] = useState<ProfileQuery>({ limit: PAGE_SIZE.toString(), page: "1" });
  const [nlSearch, setNlSearch] = useState("");
 const { user } = useAuth();

//  handle filter changes
  const handleFilterChange = (field: keyof ProfileQuery, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: "1" })); // reset to first page on filter change
  };

  const fetchProfiles = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get<ProfileApiResponse>("/api/v1/profiles", {
        params: filters,
      });
      setProfile(data.data);
      setMetaData(data.metaData);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }, [filters]);

  const handleNlSearch = async () => {
    try {
      const { data } = await axiosInstance.get<ProfileApiResponse>("/api/v1/profiles/nl-search", {
        params: { q: nlSearch, limit: filters.limit ?? PAGE_SIZE.toString(), page: filters.page ?? "1" },
      });
      setProfile(data.data);
      setMetaData(data.metaData);
    } catch (error) {
      console.error("Error performing NL search:", error);
    }
  };

  const exportFilteredProfiles = () => {
    try {
      
    } catch (error) {
      
    }
}