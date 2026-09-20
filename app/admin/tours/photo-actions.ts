"use server";

import {
  createTourPhoto,
  updateTourPhoto,
  deleteTourPhoto,
  type CreateTourPhotoInput,
} from "@/lib/queries/tourPhotos";

export async function createTourPhotoAction(input: CreateTourPhotoInput) {
  try {
    const photo = await createTourPhoto(input);

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    console.error("Error creating tour photo:", error);

    return {
      success: false,
      error: "Failed to create tour photo.",
    };
  }
}

export async function updateTourPhotoAction(
  id: string,
  input: Omit<CreateTourPhotoInput, "tourId">,
) {
  try {
    const photo = await updateTourPhoto(id, input);

    if (!photo) {
      return {
        success: false,
        error: "Tour photo not found.",
      };
    }

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    console.error("Error updating tour photo:", error);

    return {
      success: false,
      error: "Failed to update tour photo.",
    };
  }
}

export async function deleteTourPhotoAction(id: string) {
  try {
    const photo = await deleteTourPhoto(id);

    if (!photo) {
      return {
        success: false,
        error: "Tour photo not found.",
      };
    }

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    console.error("Error deleting tour photo:", error);

    return {
      success: false,
      error: "Failed to delete tour photo.",
    };
  }
}
