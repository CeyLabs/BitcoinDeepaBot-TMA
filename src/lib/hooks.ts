import { useCallback } from "react";

export function usePostRedirect() {
  const redirectInPost = useCallback((fullUrl: string) => {
    try {
      const url = new URL(fullUrl);
      const baseUrl = `${url.origin}${url.pathname}`;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = baseUrl;
      form.target = "_self";

      url.searchParams.forEach((value, key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (error) {
      console.error("Failed to redirect:", error);
    }
  }, []);

  return redirectInPost;
}

export function usePayHereRedirect() {
  const postRedirect = usePostRedirect();

  const redirectToPayHereViaPost = useCallback(
    (fullUrl: string) => {
      // Pass the complete URL directly to postRedirect
      postRedirect(fullUrl);
    },
    [postRedirect]
  );

  return redirectToPayHereViaPost;
}
