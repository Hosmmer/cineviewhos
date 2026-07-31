import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  customRender,
  screen,
  waitFor,
  userEvent,
} from "@/test/test-utils";
import { QueryClient } from "@tanstack/react-query";
import AdminMovieForm from "./AdminMovieForm";

vi.mock("@/services/movieService", () => ({
  fetchAdminMovie: vi.fn().mockResolvedValue({
    id: 1,
    title: "Test",
    description: "A great description for this movie",
    duration_minutes: 120,
    release_year: 2024,
    price: "15000",
    genre: 1,
    genre_name: "Action",
    director_fk: null,
    author_fk: null,
    actor_fk: null,
    poster: null,
    is_active: true,
  }),
  createMovie: vi.fn().mockResolvedValue({ id: 1, title: "Test" }),
  updateMovie: vi.fn().mockResolvedValue({ id: 1, title: "Updated" }),
  fetchAdminGenres: vi
    .fn()
    .mockResolvedValue([{ id: 1, name: "Action" }]),
  fetchAdminDirectors: vi.fn().mockResolvedValue([]),
  fetchAdminAuthors: vi.fn().mockResolvedValue([]),
  fetchAdminActors: vi.fn().mockResolvedValue([]),
}));

import { createMovie, updateMovie } from "@/services/movieService";

describe("AdminMovieForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates public-movies on create success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    customRender(<AdminMovieForm />, { queryClient });

    await userEvent.type(
      screen.getByLabelText(/title/i),
      "New Test Movie",
    );
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "A great description for this movie",
    );
    await userEvent.type(
      screen.getByLabelText(/duration/i),
      "120",
    );
    await userEvent.type(
      screen.getByLabelText(/release year/i),
      "2024",
    );
    await userEvent.type(screen.getByLabelText(/price/i), "15000");

    const genreSelect = screen.getByLabelText(/genre/i);
    await userEvent.selectOptions(genreSelect, "1");

    await userEvent.click(
      screen.getByRole("button", { name: /create movie/i }),
    );

    await waitFor(() => {
      expect(createMovie).toHaveBeenCalled();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["public-movies"] }),
    );
  });

  it("invalidates public-movies on update success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    customRender(<AdminMovieForm />, {
      queryClient,
      initialEntries: ["/movies/1/edit"],
      routePath: "movies/:id/edit",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /update movie/i }),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /update movie/i }),
    );

    await waitFor(() => {
      expect(updateMovie).toHaveBeenCalled();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["public-movies"] }),
    );
  });
});
