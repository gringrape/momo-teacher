export interface SurveyResponse {
    id: number;
    team_name: string;
    building: string;
    floor: string;
    gender: string;
    door_type: string;
    width: string;
    height: string;
    can_use_restroom: string;
    created_at: string;
    photos: string[] | null;
    team_members?: string;
    dream_school?: string;
    why_not_use?: string;
    handrail_types?: string;
    has_sink?: string;
    can_wash?: string;
    sink_height?: string;
}

export const fetchSurveyData = async (): Promise<SurveyResponse[]> => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/survey`);
        if (!response.ok) {
            throw new Error('Failed to fetch survey data');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching survey data:", error);
        throw error;
    }
};
