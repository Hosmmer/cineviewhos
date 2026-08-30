import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  customRender,
  screen,
  waitFor,
  userEvent,
} from "@/test/test-utils";
import { QueryClient } from "@tanstack/react-query";
import AdminMovieList from "./AdminMovieList";

vi.mock("@/features/movies/api/movies.api", () => ({
  fetchAdminMovies: vi.fn().mockResolvedValue({
    results: [
      {
        id: 1,
        title: "Test Movie",
        director_name: "",
        author_name: "",
        actor_name: "",
        release_year: 2024,
        duration_minutes: 120,
        poster: null,
        price: "15000",
        genre: 1,
        genre_name: "Action",
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ],
    count: 1,
    next: null,
    previous: null,
  }),
  deleteMovie: vi.fn().mockResolvedValue({}),
}));

import { deleteMovie } from "@/features/movies/api/movies.api";

describe("AdminMovieList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates public-movies on delete success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    customRender(<AdminMovieList />, { queryClient });

    await waitFor(() => {
      expect(screen.getByText(/test movie/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /deactivate/i }),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /deactivate/i }),
    );

    await waitFor(() => {
      expect(deleteMovie).toHaveBeenCalled();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["public-movies"] }),
    );
  });
});
