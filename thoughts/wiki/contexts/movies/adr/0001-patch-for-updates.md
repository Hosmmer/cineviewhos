# Use PATCH for movie updates instead of PUT

Movie updates use PATCH (partial update) rather than PUT (full replacement). When a staff user edits a movie without re-uploading the poster image, PATCH preserves the existing poster file. PUT would require sending the full file payload on every update, which is impractical for FormData requests where the file input is empty by default.

**Alternatives considered**: PUT with `required=False` on the poster serializer field — rejected because it weakens validation for the create flow. Sending the existing poster back from the client — rejected because it requires reading the file from the server and re-sending it, adding complexity.
