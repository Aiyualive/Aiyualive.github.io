USE [CS5346.Project];

SELECT primaryTitle AS title, primaryName AS name
FROM Processed.[title.principals.ActiveActor] -- Don't use Actor, otherwise actors no longer active will also be selected
JOIN (
	SELECT DISTINCT tconst
	FROM Processed.[title.basics.ActiveActor]
-- 	CROSS APPLY string_split(genres, ',')
-- 	WHERE value = 'Action'
) AS _ ON _.tconst = [title.principals.ActiveActor].tconst
JOIN IMDb.[name.basics] ON [name.basics].nconst = [title.principals.ActiveActor].nconst
JOIN IMDb.[title.basics] ON [title.basics].tconst = [title.principals.ActiveActor].tconst