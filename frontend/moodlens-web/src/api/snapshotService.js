import api from "./axios";

/*
GET
/api/mood-snapshots
*/
export const getSnapshots = async () => {
    const response = await api.get(
        "/mood-snapshots"
    );

    return response.data;
};

/*
POST
/api/mood-snapshots
*/
export const createSnapshot = async (
    formData
) => {
    const response = await api.post(
        "/mood-snapshots",
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
            },
        }
    );

    return response.data;
};

/*
DELETE
/api/mood-snapshots/{id}
future use
*/
export const deleteSnapshot = async (
    id
) => {
    return await api.delete(
        `/mood-snapshots/${id}`
    );
};
