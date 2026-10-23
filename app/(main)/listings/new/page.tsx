import CreateListingForm from "@/components/CreateListingForm";

const NewListingPage = () => {
    return(
        <main className="mx-auto max-w-2xl px-6 py-12">
            <h1 className="mt-30 mb-10 font-cormorant text-5xl">Create newListing</h1>
            <CreateListingForm />
        </main>

    )
}

export default NewListingPage;