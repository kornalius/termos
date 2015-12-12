dbfs.clear()
  .then ->
    dbfs.write '/My Documents/Alain Deschênes', 'Alain Deschênes'
      .then ->

        dbfs.write '/My Documents/Mélissa Dubé', 'Mélissa Dubé'
          .then ->

            dbfs.read '/My Documents/Mélissa Dubé'
              .then (doc) -> console.log doc
              .catch (err) -> console.log err

            dbfs.stats '/My Documents/Mélissa Dubé'
              .then (stats) -> console.log stats
              .catch (err) -> console.log err

            dbfs.files '/My Documents'
              .then (files) -> console.log files
              .catch (err) -> console.log err

          .catch (err) -> console.log err

      .catch (err) -> console.log err
