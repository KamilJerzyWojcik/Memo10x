namespace MemoWords.Api.Domain.Entities
{
	public enum EventType
	{
		GenerateClicked,
		TranslateGenerated,
		TranslateFailed,
		CardAddedAfterGenerate,
		EditSaved,
		DeleteConfirmed,
		DialogAddCanceled
	}
}


