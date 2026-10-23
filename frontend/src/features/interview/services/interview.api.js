import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // ignore in non-browser env
    }
    return config;
});

export const generateinterviewreport = async ({
    resume,
    selfdescription,
    jobdescription,
    title
}) => {
    const formdata = new FormData();

    if (resume) {
        formdata.append("resume", resume);
    }
    formdata.append("selfdescription", selfdescription || "");
    formdata.append("jobdescription", jobdescription || "");
    formdata.append("title", title || "");

    console.log("SENDING INTERVIEW DATA:", {
        resumeName: resume?.name,
        selfdescription,
        jobdescription,
        title
    });

    const res = await api.post("/api/interview/", formdata);
    return res.data;
};

export const interviewewportbyid = async (interviewId) => {
    const res = await api.get(`/api/interview/report/${interviewId}`);
    return res.data;
};

export const getallinterviewreports = async () => {
    const res = await api.get("/api/interview/reports");
    return res.data;
};

export const generateresumepdf = async (interviewId) => {
    const res = await api.post(
        `/api/interview/resume/pdf/${interviewId}`,
        {},
        {
            responseType: "blob",
        }
    );
    return res.data;
};
