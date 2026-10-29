import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API, { getErrorMessage } from '../services/api';

/// Fetch all skills
export const fetchSkills = createAsyncThunk(
    'skills/fetchSkill',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/skills');
            return response.data.skills;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/// Post new skill (server returns "skill", singular)
export const postSkills = createAsyncThunk(
    'skills/createSkill',
    async (skillData, { rejectWithValue }) => {
        try {
            const response = await API.post('/skills/add', skillData);
            return response.data.skill;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/// Update skill
export const updateSkill = createAsyncThunk(
    'skills/updateSkill',
    async ({ id, skillData }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/skills/${id}`, skillData);
            return response.data.skill;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteSkill = createAsyncThunk(
    'skills/deleteSkill',
    async ({ id }, { rejectWithValue }) => {
        try {
            await API.delete(`/skills/delete/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const SkillSlice = createSlice({
    name: 'Skills',
    initialState: {
        skills: [],
        isModalOpen: false,
        editId: null,
        skill: {
            name: '',
            category: '',
            proficiency: 85,
        },
        loading: false,
        error: null
    },
    reducers: {
        OpenAddModal: (state) => {
            state.isModalOpen = true;
            state.editId = null;
            state.skill = { name: '', category: '', proficiency: 85 };
        },
        OpenEditModal: (state, action) => {
            state.isModalOpen = true;
            state.editId = action.payload._id || action.payload.id;
            state.skill = {
                name: action.payload.name || '',
                category: action.payload.category || '',
                proficiency: action.payload.proficiency ?? 85,
            };
        },
        CloseModal: (state) => {
            state.isModalOpen = false;
            state.editId = null;
        },
        setFormField: (state, action) => {
            state.skill[action.payload.field] = action.payload.value;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchSkills.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSkills.fulfilled, (state, action) => {
                state.loading = false;
                state.skills = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchSkills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(postSkills.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(postSkills.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) state.skills.unshift(action.payload);
                state.isModalOpen = false;
            })
            .addCase(postSkills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateSkill.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSkill.fulfilled, (state, action) => {
                state.loading = false;
                const updatedSkill = action.payload;
                if (updatedSkill) {
                    const index = state.skills.findIndex(
                        p => (p._id || p.id) === (updatedSkill._id || updatedSkill.id)
                    );
                    if (index !== -1) state.skills[index] = updatedSkill;
                }
                state.isModalOpen = false;
            })
            .addCase(updateSkill.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteSkill.fulfilled, (state, action) => {
                state.skills = state.skills.filter(p => (p._id || p.id) !== action.payload);
            })
            .addCase(deleteSkill.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const {
    OpenAddModal,
    OpenEditModal,
    CloseModal,
    setFormField
} = SkillSlice.actions;

export default SkillSlice.reducer;
