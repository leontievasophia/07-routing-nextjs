"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import { fetchNotes } from "@/lib/api";

import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";

import css from "./Notes.module.css";

type Props = {
  tag: string;
};
export default function NotesClient({ tag }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 1000);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, debouncedSearch, tag],
    queryFn: () => fetchNotes(page, debouncedSearch, tag),
    placeholderData: keepPreviousData,
  });

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <p>Loading, please wait...</p>;
  }

  if (isError) {
    return <p>Something went wrong.</p>;
  }

  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            handleSearch(value);
          }}
        />

        <button
          type="button"
          className={css.button}
          onClick={() => setIsModalOpen(true)}
        >
          Create note
        </button>
      </div>

      {data && data.totalPages > 1 && (
        <Pagination
          pageCount={data.totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      )}

      {data && <NoteList notes={data.notes} />}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
